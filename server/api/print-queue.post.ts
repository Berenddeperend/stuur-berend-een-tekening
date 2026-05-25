export default defineEventHandler(async (event) => {
  const body = await readBody<{ drawing?: string; artist?: string; date: number }>(event);

  const config = useRuntimeConfig(event);
  console.log("the correct password is:", config.printerPassword);

  const printResponse = await $fetch("https://berendswennenhuis.nl/api/thermal-printer/drawing", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.printerPassword}`,
      "Content-Type": "application/json",
    },
    body: {
      author: body.artist,
      date: body.date,
      drawing: `${body.drawing}`,
    },
  });

  console.log(printResponse);
});
