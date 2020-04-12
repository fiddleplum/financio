"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class CategoryUtils {
    static get() {
        if (fs_1.default.existsSync('data/categories.json')) {
            return JSON.parse(fs_1.default.readFileSync('data/categories.json').toString());
        }
        return [];
    }
    static set(categories) {
        try {
            fs_1.default.writeFileSync('data/categories.json', JSON.stringify(categories));
        }
        catch (error) {
            throw new Error('Error: The file "data/categories.json" could not be written to. ' + error);
        }
    }
}
exports.default = CategoryUtils;
//# sourceMappingURL=category_utils.js.map