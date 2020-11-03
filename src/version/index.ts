import {promises as fs} from "fs";
import {offsuraConfig} from "../offsura";

export async function getVersionName() {
    const [filename] = await fs.readdir(offsuraConfig.versionFilePath);
    return filename.replace(".json", "");
}

export async function getVersionDump() {
    const versionName = await getVersionName();
    const content = (
        await fs.readFile(`${offsuraConfig.versionFilePath}/${versionName}.json`)
    ).toString();
    return JSON.parse(content).dump
}

export async function getVersionMetadata() {
    const versionName = await getVersionName();
    const content = (
        await fs.readFile(`${offsuraConfig.versionFilePath}/${versionName}.json`)
    ).toString();
    return JSON.parse(content).metadata
}
