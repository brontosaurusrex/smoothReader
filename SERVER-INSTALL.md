# Smooth Reader server installation

This guide installs Smooth Reader with Piper text-to-speech on a Debian server,
then exposes it through an existing Nginx installation using HTTPS and HTTP
Basic Authentication.

The example hostname is `reader.example.com`. Replace every occurrence with
the real hostname before requesting the certificate. The example repository is
`https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git`; replace that as well.

The resulting layout is:

| Path | Purpose |
| --- | --- |
| `/opt/smooth-reader/app` | Smooth Reader files from the `gh-pages` branch |
| `/opt/smooth-reader/venv` | Isolated Piper Python environment |
| `/var/lib/smooth-reader/voices` | Piper `.onnx` models and matching JSON files |
| `/var/cache/smooth-reader` | Generated Opus/WAV audio cache |
| `/etc/systemd/system/smooth-reader.service` | Background service |
| `/etc/nginx/sites-available/smooth-reader` | HTTPS reverse proxy |

## Assumptions

- Debian 12 or newer, on `amd64` or `arm64`
- root access through `sudo`
- Nginx is already installed or may be installed here
- the hostname resolves publicly to this server
- TCP ports 80 and 443 reach this server
- Smooth Reader is stored in a Git repository with a `gh-pages` branch
- each Piper voice has both its `.onnx` file and matching `.onnx.json` file

If the server is behind a router, forward external TCP ports 80 and 443 to it.
Do not forward port 8000: the Piper bridge deliberately listens only on
`127.0.0.1`, and Nginx is its public entry point.

## 1. Install system packages

```bash
sudo apt update
sudo apt install -y \
  apache2-utils \
  ca-certificates \
  certbot \
  ffmpeg \
  file \
  git \
  nginx \
  python3 \
  python3-venv
```

Confirm that FFmpeg has the Opus encoder used by Smooth Reader:

```bash
ffmpeg -hide_banner -encoders 2>/dev/null | grep libopus
```

Expected output contains `libopus Opus`. Smooth Reader requests mono Ogg Opus
at 48 kbps when the browser supports it and falls back to WAV otherwise.

## 2. Create the service account and directories

Create a system user with no interactive login:

```bash
id smoothreader >/dev/null 2>&1 || \
  sudo useradd \
    --system \
    --user-group \
    --home-dir /opt/smooth-reader \
    --shell /usr/sbin/nologin \
    smoothreader
```

Create the application, voice, and cache locations:

```bash
sudo install -d -o root -g root -m 0755 /opt/smooth-reader
sudo install -d -o smoothreader -g smoothreader -m 0750 \
  /var/lib/smooth-reader/voices \
  /var/cache/smooth-reader
```

The application and Piper executable will be root-owned and read-only to the
service. Only the voice and cache directories need service-user access.

## 3. Install Piper in a virtual environment

```bash
sudo python3 -m venv /opt/smooth-reader/venv
sudo /opt/smooth-reader/venv/bin/python -m pip install --upgrade pip
sudo /opt/smooth-reader/venv/bin/python -m pip install piper-tts
```

Check the installation with `--help`:

```bash
/opt/smooth-reader/venv/bin/piper --help | sed -n '1,30p'
```

Some Piper versions do not implement a standalone `--version` command and
interpret it as a synthesis request, so `--help` is the more reliable check.

## 4. Clone Smooth Reader

```bash
sudo git clone \
  --branch gh-pages \
  --single-branch \
  https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git \
  /opt/smooth-reader/app
```

Verify the important file and branch:

```bash
sudo git -C /opt/smooth-reader/app branch --show-current
test -f /opt/smooth-reader/app/piper_bridge.py && echo "Smooth Reader found"
```

The branch output should be `gh-pages`.

## 5. Install Piper voices

Copy one or more models into `/var/lib/smooth-reader/voices`. Every model needs
its sidecar configuration. For example:

```text
en_US-example-medium.onnx
en_US-example-medium.onnx.json
```

If the downloaded files are in the current user's `Downloads` directory:

```bash
sudo install -o smoothreader -g smoothreader -m 0640 \
  "$HOME/Downloads/en_US-example-medium.onnx" \
  /var/lib/smooth-reader/voices/

sudo install -o smoothreader -g smoothreader -m 0640 \
  "$HOME/Downloads/en_US-example-medium.onnx.json" \
  /var/lib/smooth-reader/voices/
```

Repeat those commands for additional voices. Voice files may be downloaded
from the Piper voice collection linked in the official Piper documentation;
check each voice's licence before redistributing it.

List the installed files:

```bash
find /var/lib/smooth-reader/voices \
  -maxdepth 1 -type f \( -name '*.onnx' -o -name '*.onnx.json' \) \
  -printf '%f\n' | sort
```

Test one model before configuring the service:

```bash
MODEL="$(find /var/lib/smooth-reader/voices -maxdepth 1 -type f -name '*.onnx' -print -quit)"
test -n "$MODEL" || { echo "No Piper model found" >&2; exit 1; }

printf '%s\n' 'This is a Smooth Reader Piper test.' | \
  sudo -u smoothreader /opt/smooth-reader/venv/bin/piper \
    -m "$MODEL" \
    -f /var/cache/smooth-reader/piper-test.wav

sudo file /var/cache/smooth-reader/piper-test.wav
sudo ls -lh /var/cache/smooth-reader/piper-test.wav
```

The result should be a valid RIFF/WAVE file rather than an empty file.

## 6. Create the systemd service

Create `/etc/systemd/system/smooth-reader.service`:

```bash
sudo tee /etc/systemd/system/smooth-reader.service >/dev/null <<'SYSTEMD'
[Unit]
Description=Smooth Reader Piper bridge
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=smoothreader
Group=smoothreader
WorkingDirectory=/opt/smooth-reader/app
Environment=PIPER_BIN=/opt/smooth-reader/venv/bin/piper
Environment=FFMPEG_BIN=/usr/bin/ffmpeg
Environment=PYTHONDONTWRITEBYTECODE=1
ExecStart=/usr/bin/python3 /opt/smooth-reader/app/piper_bridge.py --port 8000 --voice-dir /var/lib/smooth-reader/voices --cache-dir /var/cache/smooth-reader --cache-max-mb 4096
Restart=on-failure
RestartSec=3
UMask=0027

# Basic service isolation. The bridge still needs to write its audio cache.
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/cache/smooth-reader

[Install]
WantedBy=multi-user.target
SYSTEMD
```

`--cache-max-mb 4096` allows up to approximately 4 GiB of cached audio. Change
that value to suit the available storage. At 48 kbps, Opus audio is roughly
21.6 MB per hour before small container and HTTP overheads.

Load, enable, and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now smooth-reader
sudo systemctl status smooth-reader --no-pager -l
```

Check the local API:

```bash
curl -fsS http://127.0.0.1:8000/api/piper/status | python3 -m json.tool
```

Look for:

- `"available": true`
- at least one entry under `voices`
- the expected voice and cache directories
- `"audioCodec": "opus"`
- `"audioBitrateKbps": 48`

If this request fails, inspect recent logs:

```bash
sudo journalctl -u smooth-reader -n 100 --no-pager
```

## 7. Prepare DNS and the ACME webroot

Create an `A` record for IPv4 and, if the server has working public IPv6, an
`AAAA` record. Both must point to this server. An incorrect `AAAA` record can
break certificate validation even when IPv4 is correct.

Create the Certbot webroot:

```bash
sudo install -d -o root -g www-data -m 0755 /var/www/letsencrypt
```

Create the initial HTTP-only Nginx virtual host. Replace
`reader.example.com` first:

```bash
sudo tee /etc/nginx/sites-available/smooth-reader >/dev/null <<'NGINX'
server {
    listen 80;
    listen [::]:80;

    server_name reader.example.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
```

Enable the site and test Nginx before reloading it:

```bash
sudo ln -s /etc/nginx/sites-available/smooth-reader \
  /etc/nginx/sites-enabled/smooth-reader
sudo nginx -t
sudo systemctl reload nginx
```

If the symlink already exists, do not create another one; continue with
`nginx -t`.

## 8. Request the HTTPS certificate

After DNS resolves and port 80 is reachable from the internet:

```bash
sudo certbot certonly \
  --webroot \
  --webroot-path /var/www/letsencrypt \
  --domain reader.example.com
```

The certificate and key should appear beneath:

```text
/etc/letsencrypt/live/reader.example.com/
```

The webroot method leaves Nginx running and gives Certbot a dedicated path for
the HTTP-01 challenge.

## 9. Add password protection

Create the first reader account. The command prompts for its password:

```bash
sudo htpasswd -c /etc/nginx/.htpasswd-smooth-reader reader
sudo chown root:www-data /etc/nginx/.htpasswd-smooth-reader
sudo chmod 0640 /etc/nginx/.htpasswd-smooth-reader
```

For another account, omit `-c`; using `-c` again would replace the existing
password file:

```bash
sudo htpasswd /etc/nginx/.htpasswd-smooth-reader another-reader
```

Basic Authentication is safe here because credentials are only requested from
the HTTPS virtual host. Do not add it to an unencrypted HTTP-only deployment.

## 10. Replace the Nginx configuration with HTTPS

Replace `/etc/nginx/sites-available/smooth-reader` with the following. Again,
replace every `reader.example.com` occurrence:

```bash
sudo tee /etc/nginx/sites-available/smooth-reader >/dev/null <<'NGINX'
server {
    listen 80;
    listen [::]:80;

    server_name reader.example.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name reader.example.com;

    ssl_certificate /etc/letsencrypt/live/reader.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reader.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    auth_basic "Smooth Reader";
    auth_basic_user_file /etc/nginx/.htpasswd-smooth-reader;

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header Referrer-Policy no-referrer always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        proxy_buffering off;
    }
}
NGINX
```

Important: Nginx directives end with a plain semicolon. Do not write `\;` after
`proxy_pass`, `return`, or another directive—the backslash changes the value and
causes a configuration error.

Test before every reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 11. Verify the public service

HTTP should redirect to HTTPS:

```bash
curl -I http://reader.example.com
```

HTTPS without credentials should return `401 Unauthorized`:

```bash
curl -I https://reader.example.com
```

Finally, check the authenticated Piper endpoint, replacing `reader` if a
different username was created:

```bash
curl -u reader \
  https://reader.example.com/api/piper/status | \
  python3 -m json.tool
```

Open `https://reader.example.com` in a browser, sign in, load an EPUB, and test
speech. A hard refresh (`Ctrl+F5`) is useful after application updates.

## Multiuser behavior

- EPUB files, recent books, positions, and book-specific display settings stay
  in each user's browser storage; they are not uploaded to the server.
- Each browser tab has an independent speech-session identifier.
- Stopping speech in one tab does not stop another tab's Piper job.
- Cached audio downloads and cache hits can run concurrently.
- Uncached Piper synthesis uses one fair shared queue, which prevents several
  users from overloading a small server simultaneously.
- Generated audio is shared by cache identity, so repeated text with the same
  model and speaker can avoid another synthesis run.
- Pause and resume happen in the browser and do not occupy a server-side audio
  player.

Basic Authentication controls access to the whole site, but it is not an
application account system and does not provide cross-device book syncing.

## Updating Smooth Reader

After pushing an update to the repository's `gh-pages` branch:

```bash
sudo git -C /opt/smooth-reader/app pull --ff-only
sudo systemctl restart smooth-reader
sudo systemctl status smooth-reader --no-pager -l
```

If only static HTML, CSS, or JavaScript changed, restarting is harmless and
ensures the bridge serves the updated files. If `piper_bridge.py` changed, the
restart is required.

To upgrade Piper independently:

```bash
sudo /opt/smooth-reader/venv/bin/python -m pip install --upgrade piper-tts
sudo systemctl restart smooth-reader
```

## Certificate renewal

Debian's Certbot package normally installs a systemd renewal timer. Inspect it
and add an explicit deploy hook so Nginx reloads after a renewed certificate:

```bash
sudo install -d -o root -g root -m 0755 \
  /etc/letsencrypt/renewal-hooks/deploy

sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx >/dev/null <<'HOOK'
#!/bin/sh
systemctl reload nginx
HOOK

sudo chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx
```

Then inspect the timer and run a dry renewal test:

```bash
systemctl list-timers --all | grep certbot
sudo certbot renew --dry-run
```

The HTTP virtual host must continue serving
`/.well-known/acme-challenge/` without authentication so renewal can succeed.

## Troubleshooting

### `502 Bad Gateway`

Nginx cannot reach the local bridge:

```bash
sudo systemctl status smooth-reader --no-pager -l
sudo journalctl -u smooth-reader -n 100 --no-pager
curl -v http://127.0.0.1:8000/api/piper/status
```

### Piper reports no voices

Check names, permissions, and matching JSON files:

```bash
sudo -u smoothreader find /var/lib/smooth-reader/voices \
  -maxdepth 1 -type f -printf '%f\n' | sort
```

The sidecar name must be the full model filename plus `.json`, such as
`voice.onnx.json`.

### Cache permission errors

```bash
sudo chown -R smoothreader:smoothreader /var/cache/smooth-reader
sudo chmod 0750 /var/cache/smooth-reader
sudo systemctl restart smooth-reader
```

### Nginx refuses to reload

Never reload until this succeeds:

```bash
sudo nginx -t
```

Print the active virtual host with line numbers when locating a malformed
directive:

```bash
sudo nl -ba /etc/nginx/sites-enabled/smooth-reader
```

### Certificate validation fails

Confirm that DNS resolves to the correct public addresses, ports 80 and 443 are
forwarded and allowed through the firewall, and the ACME location is public:

```bash
getent ahosts reader.example.com
curl -I http://reader.example.com/.well-known/acme-challenge/test
```

A `404` from Nginx is acceptable for the nonexistent test file; a timeout,
unrelated site, or authentication prompt is not.

### The browser still uses old JavaScript or CSS

Restart the service after pulling, then use `Ctrl+F5`. Smooth Reader also uses
versioned asset names and cache-busting query strings to avoid mixed releases.

## Security notes

- Keep port 8000 bound to loopback and inaccessible from the internet.
- Use HTTPS before enabling or entering Basic Authentication credentials.
- Give each person a separate password entry when practical.
- Keep Debian, Nginx, Certbot, FFmpeg, Piper, and the reader updated.
- Review `journalctl` and Nginx logs after unexplained failures.
- EPUB contents stay local to the browser, but text chunks selected for Piper
  are sent to this server and cached as audio.
- The audio cache contains spoken book text. Protect it with service-user
  permissions and size it appropriately.

## Upstream references

- [Piper project and installation](https://github.com/OHF-Voice/piper1-gpl)
- [Certbot webroot and Nginx documentation](https://eff-certbot.readthedocs.io/en/stable/using.html)
- [Nginx proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Nginx Basic Authentication module](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html)
