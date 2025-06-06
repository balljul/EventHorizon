import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/services/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';

/**
 * Service for handling authentication operations.
 * Manages user login, registration, and JWT token generation.
 * 
 * @class AuthService
 * @author Philipp Borkovic
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user and returns access token.
   * 
   * @param {LoginDto} loginDto - Login credentials
   * @returns {Promise<{access_token: string, user: any}>} Access token and user info
   * @throws {UnauthorizedException} If credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    try {
      const user = await this.userService.validateUser(loginDto.email, loginDto.password);
      const userWithRoles = await this.userService.findUserWithRoles(user.id);
      
      const payload = { 
        email: user.email, 
        sub: user.id,
        roles: userWithRoles.roles?.map(role => role.name) || []
      };
      
      const accessToken = this.jwtService.sign(payload);
      
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: userWithRoles.roles?.map(role => role.name) || []
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Registers a new user and returns access token.
   * 
   * @param {RegisterDto} registerDto - Registration data
   * @returns {Promise<{access_token: string, user: any}>} Access token and user info
   * @throws {ConflictException} If email already exists
   */
  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: any }> {
    try {
      const user = await this.userService.create(registerDto);
      const userWithRoles = await this.userService.findUserWithRoles(user.id);
      
      const payload = { 
        email: user.email, 
        sub: user.id,
        roles: userWithRoles.roles?.map(role => role.name) || []
      };
      
      const accessToken = this.jwtService.sign(payload);
      
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: userWithRoles.roles?.map(role => role.name) || []
        }
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new UnauthorizedException('Registration failed');
    }
  }

  /**
   * Validates a user by JWT payload.
   * 
   * @param {any} payload - JWT payload
   * @returns {Promise<User>} The validated user
   */
  async validateUser(payload: any): Promise<User> {
    const user = await this.userService.findUserWithRoles(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}