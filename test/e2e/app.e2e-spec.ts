import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { Server } from 'http';

import { AppFactory } from '../factories/app.factory';
import { AuthService } from '../../src/auth/auth.service';
import { SignUpDto } from '../../src/auth/dto/sign-up.dto';
import { UserFactory } from '../factories/user.factory';
import { SignInDto } from '../../src/auth/dto/sign-in.dto';

describe('App (e2e)', () => {
  let app: AppFactory;
  let server: Server;
  let dataSource: DataSource;
  let authService: AuthService;

  beforeAll(async () => {
    app = await AppFactory.new();
    server = app.instance.getHttpServer();
    dataSource = app.dbSource;
    authService = app.instance.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.cleanupDB();
  });

  describe('AppModule', () => {
    describe('GET /', () => {
      it("should return 'Hello World'", () => {
        return request(app.instance.getHttpServer())
          .get('/')
          .expect(HttpStatus.OK)
          .expect('Hello World!');
      });
    });
  });

  describe('AuthModule', () => {
    describe('POST /auth/sign-up', () => {
      it('should create a new user', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));

        const signUpDto: SignUpDto = {
          email: 'atest@email.com',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
          username: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CREATED);
      });

      it('should return 400 for invalid sign up fields', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));

        const signUpDto: SignUpDto = {
          email: 'invalid-email',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
          username: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 409 if user already exists', async () => {
        await UserFactory.new(dataSource).create({
          email: 'atest@email.com',
          password: 'Pass#123',
        });

        const signUpDto: SignUpDto = {
          email: 'atest@email.com',
          password: 'Pass#123',
          passwordConfirm: 'Pass#123',
          username: 'test',
          firstName: 'A',
          lastName: 'Test',
          phoneNumber: '',
        };

        return request(server)
          .post('/auth/sign-up')
          .send(signUpDto)
          .expect(HttpStatus.CONFLICT);
      });
    });

    describe('POST /auth/sign-in', () => {
      it('should sign in the user and return access token', async () => {
        const email = 'atest@email.com';
        const password = 'Pass#123';
        await UserFactory.new(dataSource).create({
          email,
          password,
        });

        const signInDto: SignInDto = {
          email,
          password,
        };

        return request(server)
          .post('/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual({ accessToken: expect.any(String) });
          });
      });

      it('should return 400 for invalid sign in fields', async () => {
        const signInDto: SignInDto = {
          email: 'atest@email.com',
          password: '',
        };

        return request(server)
          .post('/auth/sign-in')
          .send(signInDto)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
