exports.error_printer = (location, err) => {
    console.log("\n-------------------------------------\n");
    console.log(`Error at : ${location}\n\n\n`);
    console.log(err);
    console.log("\n-------------------------------------\n");
}