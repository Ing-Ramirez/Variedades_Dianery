from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def test_api_requires_admin_and_filters_public_store():
    api = read("api.php")
    require("X-Dianery-Admin-Token" in api, "api.php must use the admin token header")
    require("function public_store" in api, "api.php must expose a public-store filter")
    require("if ($method === 'POST')" in api, "api.php must handle POST explicitly")
    post_block = api.split("if ($method === 'POST')", 1)[1]
    require("require_admin();" in post_block.split("$raw = file_get_contents", 1)[0], "POST must require admin before reading/writing payload")
    public_block = api.split("function public_store", 1)[1].split("function load_store", 1)[0]
    require("'orders'" not in public_block and "'customers'" not in public_block, "public_store must not expose orders/customers")


def test_jsonld_is_hex_encoded():
    index = read("index.php")
    for flag in ["JSON_HEX_TAG", "JSON_HEX_AMP", "JSON_HEX_APOS", "JSON_HEX_QUOT"]:
        require(flag in index, f"index.php JSON-LD must include {flag}")
    require("function jsonld" in index, "index.php must centralize JSON-LD encoding")


def test_og_image_restricts_active_content():
    og = read("og-image.php")
    require("image/(?:jpeg|jpg|png|webp)" in og, "og-image.php must restrict allowed image MIME types")
    require("base64_decode($m[2], true)" in og, "og-image.php must use strict base64 decoding")
    require("X-Content-Type-Options" in og, "og-image.php must set nosniff")
    require("image/svg" not in og, "og-image.php must not allow SVG data URLs")


def test_config_urls_are_allowlisted_client_and_server():
    api = read("api.php")
    data = read("dianery-data.js")
    bottom = read("components/Bottom.jsx")
    require("function safe_url" in api, "api.php must centralize URL allowlisting")
    require("['https', 'http', 'mailto', 'tel']" in api, "api.php must only allow expected URL schemes")
    require("function safeUrl" in data, "dianery-data.js must centralize client URL allowlisting")
    for protocol in ["https:", "http:", "mailto:", "tel:"]:
        require(protocol in data, f"dianery-data.js must allow legitimate {protocol} links")
    require("new URL(url)" in data, "dianery-data.js must parse configured URLs before accepting them")
    require("safeUrl(chat.href)" in data, "chat href must be sanitized before saving")
    require("cleanSocialLinks" in data, "social links must be sanitized before saving")
    require("function safeHref" in bottom and "DD.safeUrl" in bottom, "footer/chat anchors must render sanitized hrefs")
    require("href={s.href}" not in bottom and "href={real ? data.href : \"#\"}" not in bottom, "raw configured hrefs must not be rendered")


def test_admin_uses_token_gate():
    data = read("dianery-data.js")
    admin_html = read("admin/Admin.html")
    shell = read("admin/AdminShell.jsx")
    require("X-Dianery-Admin-Token" in data, "dianery-data.js must send admin token header")
    require("verifyAdminToken" in data, "dianery-data.js must expose token verification")
    require("window.DIANERY_ADMIN_MODE = true" in admin_html, "Admin.html must enable admin mode before data layer")
    require("AdminLogin" in shell and "hasAdminToken" in shell, "AdminShell must gate admin views behind token presence")


def test_server_and_deploy_hardening():
    htaccess = read(".htaccess")
    deploy = read(".github/workflows/deploy.yml")
    gitignore = read(".gitignore")
    dockerignore = read(".dockerignore")
    require("data\\.json" in htaccess and "Require all denied" in htaccess, ".htaccess must deny direct data.json access")
    require(".claude" in htaccess and ".codex" in htaccess, ".htaccess must block assistant folders if deployed")
    require("StrictHostKeyChecking=no" not in deploy, "deploy must not disable host key checking")
    require("SSH_KNOWN_HOSTS" in deploy, "deploy must require pinned known_hosts")
    for folder in [".claude", ".codex"]:
        require(folder in gitignore, f".gitignore must ignore {folder}")
        require(folder in dockerignore, f".dockerignore must ignore {folder}")


if __name__ == "__main__":
    tests = [
        test_api_requires_admin_and_filters_public_store,
        test_jsonld_is_hex_encoded,
        test_og_image_restricts_active_content,
        test_config_urls_are_allowlisted_client_and_server,
        test_admin_uses_token_gate,
        test_server_and_deploy_hardening,
    ]
    for test in tests:
        test()
        print(f"OK {test.__name__}")
