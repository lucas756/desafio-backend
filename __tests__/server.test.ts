import request from "supertest";

import app from "../src/app";

describe('Test server.ts is running', () => {
    describe('get /', () => {
      it('should return a 200', () => {
        request(app).get('/server-test').then((res) => {
          expect(res.statusCode).toBe(200);
        });
      });
    });
  });