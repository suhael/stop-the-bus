const { client } = require("../client");

// Get current host (The Driver)
const getHost = async (roomId) => {
  return await client.hGet(`room:${roomId}`, "host_id");
};

module.exports = getHost;
