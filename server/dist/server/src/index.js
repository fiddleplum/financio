'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ws_1 = __importDefault(require("ws"));
const account_utils_1 = __importDefault(require("./account_utils"));
const category_utils_1 = __importDefault(require("./category_utils"));
function processMessage(ws, message) {
    return __awaiter(this, void 0, void 0, function* () {
        let request = JSON.parse(message);
        let requestData = request.data;
        let responseData;
        let success = false;
        let error = '';
        console.log('received: %s', JSON.stringify(requestData));
        try {
            if (requestData.command === 'list accounts') {
                responseData = account_utils_1.default.list();
            }
            else if (requestData.command === 'create account') {
                let name = requestData.name;
                let currency = requestData.currency;
                let parentId = requestData.parentId;
                let beforeId = requestData.beforeId;
                let isGroup = requestData.isGroup;
                responseData = account_utils_1.default.create(name, currency, parentId, beforeId, isGroup);
            }
            else if (requestData.command === 'delete account') {
                let id = requestData.id;
                responseData = account_utils_1.default.delete(id);
            }
            else if (requestData.command === 'view account') {
                let id = requestData.id;
                responseData = account_utils_1.default.view(id);
            }
            else if (requestData.command === 'rename account') {
                let id = requestData.id;
                let newName = requestData.newName;
                responseData = account_utils_1.default.rename(id, newName);
            }
            else if (requestData.command === 'list transactions') {
                let id = requestData.id;
                let startDate = requestData.startDate;
                let endDate = requestData.endDate;
                let search = requestData.search;
                let minAmount = requestData.minAmount;
                let maxAmount = requestData.maxAmount;
                responseData = account_utils_1.default.listTransactions(id, startDate, endDate, search, minAmount, maxAmount);
            }
            else if (requestData.command === 'check duplicate transactions') {
                let name = requestData.name;
                let transactions = requestData.transactions;
                responseData = account_utils_1.default.checkDuplicateTransactions(name, transactions);
            }
            else if (requestData.command === 'add transactions') {
                let name = requestData.name;
                let transactions = requestData.transactions;
                responseData = account_utils_1.default.addTransactions(name, transactions);
            }
            else if (requestData.command === 'get categories') {
                responseData = category_utils_1.default.get();
            }
            else if (requestData.command === 'set categories') {
                let categories = requestData.categories;
                responseData = category_utils_1.default.set(categories);
            }
            else {
                throw new Error('Unknown command.');
            }
            success = true;
        }
        catch (e) {
            console.log('Error: ' + e.message);
            error = e.message;
        }
        ws.send(JSON.stringify({
            id: request.id,
            success: success,
            error: error,
            data: responseData
        }));
    });
}
function startServer() {
    const wss = new ws_1.default.Server({
        port: 8081
    });
    if (!fs_1.default.existsSync('data/')) {
        fs_1.default.mkdirSync('data/');
    }
    account_utils_1.default.initialize();
    console.log('The server has started.');
    wss.on('connection', (ws) => {
        console.log('Accepted a new connection.');
        ws.on('message', (message) => {
            processMessage(ws, message.toString());
        });
        ws.on('close', () => {
            console.log('Closed a connection.');
        });
        ws.on('error', () => {
            console.log('Error in connection.');
        });
    });
}
startServer();
//# sourceMappingURL=index.js.map