const fs = require("fs");

const version = JSON.parse(fs.readFileSync("../package.json", "utf8")).version;

const OWNER = "Outer-Wilds-New-Horizons";
const REPO = "nh-config-editor";

const BASE_STR = `https://github.com/${OWNER}/${REPO}/releases`;

const updateObj = {
    version,
    notes: `View changelog at: ${BASE_STR}/tags/v${version}`,
    pub_date: new Date().toISOString(),
    platforms: {
        "darwin-x86_64": {
            signature: fs.readFileSync(`New.Horizons.Config.Editor.app.tar.gz.sig`, "utf8"),
            url: `${BASE_STR}/download/${version}/New.Horizons.Config.Editor.app.tar.gz`
        },
        "linux-x86_64": {
            signature: fs.readFileSync(
                `new-horizons-config-editor_${version}_amd64.AppImage.tar.gz.sig`,
                "utf8"
            ),
            url: `${BASE_STR}/download/${version}/new-horizons-config-editor_${version}_amd64.AppImage.tar.gz`
        },
        "windows-x86_64": {
            signature: fs.readFileSync(
                `New.Horizons.Config.Editor_${version}_x64_en-US.msi.zip.sig`,
                "utf8"
            ),
            url: `${BASE_STR}/download/${version}/New.Horizons.Config.Editor_${version}_x64_en-US.msi.zip`
        }
    }
};

fs.writeFileSync("latest-version.json", JSON.stringify(updateObj, null, 4));
