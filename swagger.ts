// swagger.ts
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sync Backend Api",
      version: "1.0.0",
      description: "Auto-generated API documentation",
    },
    servers: [
      {
        url: "http://localhost:5000/api", // your base API path
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/authRoutes/*.ts", "./routes/*.ts"], // path to files with JSDoc
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
