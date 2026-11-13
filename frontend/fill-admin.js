void import("./fill-admin.mjs").catch((error) => {
  console.error("La génération des pages admin a échoué.", error);
  process.exitCode = 1;
});