const fs = require('fs');
const path = require('path');
let moduleName = process.argv.length > 2 && process.argv[2];

if (!moduleName) {
    console.log('\x1b[35mMissing name of the module!\n\x1b[0m');
    return;
}

moduleName = moduleName.trim();
const camelName = moduleName.substr(0, 1).toLowerCase() + moduleName.substr(1);
const pascalName = moduleName.substr(0, 1).toUpperCase() + moduleName.substr(1);

const entityPath = path.join(__dirname, `../../../application/entities/${pascalName}.ts`);
const entity = getFileContent(path.join(__dirname, 'entity.tmp'), camelName, pascalName);

const modelDirPath = path.join(__dirname, `../../../application/models/${camelName}`);
const modelViewPath = path.join(__dirname, `../../../application/models/${camelName}/${pascalName}View.ts`);
const modelView = getFileContent(path.join(__dirname, 'modelView.tmp'), camelName, pascalName);
const modelReferencePath = path.join(__dirname, `../../../application/models/${camelName}/${pascalName}Reference.ts`);
const modelReference = getFileContent(path.join(__dirname, 'modelReference.tmp'), camelName, pascalName);

const modelCreatePath = path.join(__dirname, `../../../application/models/${camelName}/${pascalName}Create.ts`);
const modelCreate = getFileContent(path.join(__dirname, 'modelCreate.tmp'), camelName, pascalName);
const modelUpdatePath = path.join(__dirname, `../../../application/models/${camelName}/${pascalName}Update.ts`);
const modelUpdate = getFileContent(path.join(__dirname, 'modelUpdate.tmp'), camelName, pascalName);

const businessInterfacePath = path.join(__dirname, `../../../application/businesses/interfaces/I${pascalName}Business.ts`);
const businessInterface = getFileContent(path.join(__dirname, 'businessInterface.tmp'), camelName, pascalName);

const businessPath = path.join(__dirname, `../../../application/businesses/${pascalName}Business.ts`);
const business = getFileContent(path.join(__dirname, 'business.tmp'), camelName, pascalName);

const controllerPath = path.join(__dirname, `../../../controllers/${pascalName}Controller.ts`);
const controller = getFileContent(path.join(__dirname, 'controller.tmp'), camelName, pascalName);

const claimPath = path.join(__dirname, `../../../resources/permissions/${pascalName}Claim.ts`);
const claim = getFileContent(path.join(__dirname, 'claim.tmp'), camelName, pascalName);

const initializationPath = path.join(__dirname, `../../../resources/data/initialization/${pascalName}.ts`);
const initialization = getFileContent(path.join(__dirname, 'initialization.tmp'), camelName, pascalName);

const businessTestingPath = path.join(__dirname, `../../../test/02.businesses/${pascalName}Testing.ts`);
const businessTesting = getFileContent(path.join(__dirname, 'businessTesting.tmp'), camelName, pascalName);

if (!fs.existsSync(modelDirPath))
    fs.mkdirSync(modelDirPath);

fs.writeFileSync(entityPath, entity);
fs.writeFileSync(modelViewPath, modelView);
fs.writeFileSync(modelReferencePath, modelReference);
fs.writeFileSync(modelCreatePath, modelCreate);
fs.writeFileSync(modelUpdatePath, modelUpdate);
fs.writeFileSync(businessInterfacePath, businessInterface);
fs.writeFileSync(businessPath, business);
fs.writeFileSync(controllerPath, controller);
fs.writeFileSync(claimPath, claim);
fs.writeFileSync(initializationPath, initialization);
fs.writeFileSync(businessTestingPath, businessTesting);

/**
 * Get content of special file
 * @param {string} path Generate source code to directory
 * @param {string} camelName The module name with camel style
 * @param {string} pascalName The module name with pascal style
 */
function getFileContent(path, camelName, pascalName) {
    return fs.readFileSync(path, 'utf8').replace(new RegExp('{camelName}', 'g'), camelName).replace(new RegExp('{pascalName}', 'g'), pascalName);
}
