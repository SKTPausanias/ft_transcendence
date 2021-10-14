"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const whitelist = ['http://localhost:4200', 'api.example.com'];
    app.enableCors({
        origin: function (origin, callback) {
            if (!origin || whitelist.indexOf(origin) !== -1) {
                console.log(1);
                callback(null, true);
            }
            else {
                console.log(2);
                callback(new Error('Not allowed by CORS'));
            }
        }
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map