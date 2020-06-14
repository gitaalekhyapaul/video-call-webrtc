const { readFile, writeFile } = require("fs");
const { join } = require("path");
const { promisify } = require("util");
const readData = promisify(readFile);
const writeData = promisify(writeFile);

const readClients = async () => {
  try {
    const data = await readData(join(__dirname, "fakeDB.json"));
    const parsedData = JSON.parse(data);
    return parsedData.clients;
  } catch (error) {
    throw error;
  }
};

const readRooms = async () => {
  try {
    const data = await readData(join(__dirname, "fakeDB.json"));
    const parsedData = JSON.parse(data);
    return parsedData.rooms;
  } catch (error) {
    throw error;
  }
};

const writeClients = async (clientArray) => {
  try {
    const data = await readData(join(__dirname, "fakeDB.json"));
    const parsedData = JSON.parse(data);
    parsedData.clients = clientArray;
    const result = await writeData(
      join(__dirname, "fakeDB.json"),
      JSON.stringify(parsedData)
    );
    return true;
  } catch (error) {
    throw error;
  }
};

const writeRooms = async (roomArray) => {
  try {
    const data = await readData(join(__dirname, "fakeDB.json"));
    const parsedData = JSON.parse(data);
    parsedData.rooms = roomArray;
    const result = await writeData(
      join(__dirname, "fakeDB.json"),
      JSON.stringify(parsedData)
    );
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  readClients,
  writeClients,
  readRooms,
  writeRooms,
};
