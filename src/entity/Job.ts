import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';
import {JsonMap} from "@/interfaces/json";
import {IJobStatus} from "@/interfaces/api";

export interface IDescAttribute extends JsonMap {
  type :{$type :string};
  start :number;
  length :number;
}

export interface IMetaJob {
  title :string;
  description :string;
  descMeta :IDescAttribute[];
  translatedDescription ?:string|null;
}

@Entity()
@Index([ 'publishedAt', 'expireAt' ])
@Index([ 'updatedDate' ])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  jid :string;

  @Column({
    type: 'int8',
    nullable: true,
    default: null,
  })
  lid :number;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  applies :number;

  @Column({
    type: 'integer',
    nullable: true,
    default: null,
  })
  views :number;

  @Column({
    type: 'text',
    comment: 'lower case title for search',
  })
  title :string;

  @Column({
    type: 'text',
    comment: 'lower case description for search',
  })
  description :string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isEasyApply :boolean;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    default: null,
  })
  source :string|null;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
    default: null,
  })
  expireAt :Date;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
    default: null,
  })
  publishedAt :Date;

  @Column({
    type: 'timestamp without time zone',
    nullable: true,
    default: null,
  })
  origPublishAt :Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: null,
  })
  meta :IMetaJob;

  @Column({
    type: 'int2',
    nullable: false,
    default: 0,
  })
  status :IJobStatus;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdDate :Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedDate :Date;
}
