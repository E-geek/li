import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity()
@Index([ 'updatedDate', 'lid' ])
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  vid :string;

  @Column({
    type: 'int8',
    nullable: true,
    default: null,
  })
  lid :number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title :string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  description :string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  meta :any;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdDate :Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedDate :Date;
}
