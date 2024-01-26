import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @ApiProperty({
    description: 'ID of user',
    example: '89c018cc-8a77-4dbd-94e1-dbaa710a2a9c',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Username of user', example: 'user123' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ description: 'First name of user', example: 'John' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'Last name of user', example: 'Doe' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'Email of user', example: 'atest@email.com' })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty({
    description: 'Phone Number of user',
  })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({
    description: 'Phone Number of user',
  })
  @Column({ nullable: true })
  avatarUrl: string;

  @ApiProperty({
    description: 'Phone Number of user',
  })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ description: 'Verification status of user', default: false })
  @Column({ default: false })
  isVerify: boolean;

  @ApiProperty({ description: 'Created date of user' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date of user' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
