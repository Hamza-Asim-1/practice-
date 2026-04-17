"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostcodesModule = void 0;
const common_1 = require("@nestjs/common");
const postcodes_controller_1 = require("./postcodes.controller");
const postcodes_service_1 = require("./postcodes.service");
let PostcodesModule = class PostcodesModule {
};
exports.PostcodesModule = PostcodesModule;
exports.PostcodesModule = PostcodesModule = __decorate([
    (0, common_1.Module)({
        controllers: [postcodes_controller_1.PostcodesController],
        providers: [postcodes_service_1.PostcodesService],
        exports: [postcodes_service_1.PostcodesService]
    })
], PostcodesModule);
//# sourceMappingURL=postcodes.module.js.map