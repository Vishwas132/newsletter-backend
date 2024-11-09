import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        this.logger.warn(
          `User with email ${createUserDto.email} already exists`,
        );
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);

      const user = this.usersRepository.create([
        {
          ...createUserDto,
          passwordHash,
        },
      ]);

      // // Explicitly type the save operation to return a single User
      const savedUser = await this.usersRepository.save(user);
      this.logger.log(
        `User created successfully with ID: ${JSON.stringify(savedUser)}`,
      );
      this.logger.log(`User created successfully with ID: ${savedUser[0].id}`);

      return savedUser[0];
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(organizationId: string): Promise<User[]> {
    try {
      this.logger.log(`Fetching all users for organization: ${organizationId}`);
      return await this.usersRepository.find({
        where: { organizationId },
        relations: ['organization'],
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch users for organization ${organizationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: string, organizationId: string): Promise<User> {
    try {
      this.logger.log(`Finding user ${id} in organization ${organizationId}`);

      const user = await this.usersRepository.findOne({
        where: { id, organizationId },
        relations: ['organization'],
      });

      if (!user) {
        this.logger.warn(
          `User ${id} not found in organization ${organizationId}`,
        );
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      this.logger.log(`Finding user by email: ${email}`);

      const user = await this.usersRepository.findOne({
        where: { email },
        relations: ['organization'],
      });

      if (!user) {
        this.logger.warn(`User with email ${email} not found`);
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user by email ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    organizationId: string,
    updateUserDto: any,
  ): Promise<User> {
    try {
      this.logger.log(`Updating user ${id} in organization ${organizationId}`);

      const user = await this.findOne(id, organizationId);

      if (updateUserDto.password) {
        updateUserDto.passwordHash = await bcrypt.hash(
          updateUserDto.password,
          10,
        );
        delete updateUserDto.password;
      }

      Object.assign(user, updateUserDto);

      const updatedUser = await this.usersRepository.save(user);
      this.logger.log(`User ${id} updated successfully`);

      return updatedUser;
    } catch (error) {
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: string, organizationId: string): Promise<void> {
    try {
      this.logger.log(
        `Removing user ${id} from organization ${organizationId}`,
      );

      const user = await this.findOne(id, organizationId);
      await this.usersRepository.remove(user);

      this.logger.log(`User ${id} removed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to remove user ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    try {
      this.logger.log(`Validating user credentials for ${email}`);

      const user = await this.findByEmail(email);

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user ${email}`);
        throw new NotFoundException('Invalid credentials');
      }

      this.logger.log(`User ${email} validated successfully`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to validate user ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
