const config = require("./config.js");
const fs = require("fs/promises");
const path = require("path");
const nbt = require("prismarine-nbt");

const makePlayerMarker = async function(filename) {
    const buffer = await fs.readFile(path.join(".", config.playerdataDir, filename));
    const { parsed } = await nbt.parse(buffer);
    const player = await parsed.value;
    const position = player.Pos.value.value;
    return (`{
        x: ${Math.round(position[0]) + config.player.imageOffset[0] * Math.sign(position[0])},
        z: ${Math.round(position[2]) + config.player.imageOffset[1] * Math.sign(position[2])},
        image: "${config.player.image}",
        imageAnchor: [${config.player.imageAnchor[0]}, ${config.player.imageAnchor[1]}],
        imageScale: ${config.player.imageScale}
    },`);
};

const makeWorldspawnMarker = async function() {
    const buffer = await fs.readFile(path.join(".", config.levelDat));
    const { parsed } = await nbt.parse(buffer);
    const level = await parsed.value.Data.value;
    return (`{
        x: ${Math.round(level.SpawnX.value) + config.worldspawn.imageOffset[0] * Math.sign(level.SpawnX.value)},
        z: ${Math.round(level.SpawnZ.value) + config.worldspawn.imageOffset[1] * Math.sign(level.SpawnZ.value)},
        image: "${config.worldspawn.image}",
        imageAnchor: [${config.worldspawn.imageAnchor[0]}, ${config.worldspawn.imageAnchor[1]}],
        imageScale: ${config.worldspawn.imageScale}
    },`);
};

(async function() {
    let result = [];

    result.push(`UnminedCustomMarkers = { isEnabled: true, markers: [`);

    const dir = await fs.readdir(path.join(".", config.playerdataDir), { withFileTypes: true });
    for(let i = 0; i < dir.length; i++) {
        if(dir[i].isFile() && path.parse(dir[i].name).ext === ".dat") {
            result.push(await makePlayerMarker(path.join(".", dir[i].name)));
        }
    }

    // Worldspawn flag
    result.push(await makeWorldspawnMarker());
    result.push(`]}`);
    
    await fs.writeFile(path.join(".", config.outputFile), result.join("").replace(/[\r\n\s]/g, ""));
})();
