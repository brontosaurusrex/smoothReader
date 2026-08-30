.PHONY: run serve check

run: serve

serve:
	python3 -m http.server 8000

check:
	node --check renderer-v13.js
	node test/smoke-renderer.js
	node test/vendor-archive.js
