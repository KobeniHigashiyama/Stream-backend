import { Field, ID, ObjectType } from '@nestjs/graphql';
import { DeviceInfo, LocationInfo, SessionMetadata } from '@/src/share/types/session_metada';

@ObjectType()
export class LocationModel implements LocationInfo {
  @Field(() => String, { nullable: true })
  public country: string;

  @Field(() => String, { nullable: true })
  public city: string;

  @Field(() => Number, { nullable: true })
  public latitude: number;

  @Field(() => Number, { nullable: true })
  public longitude: number;
}

@ObjectType()
export class DeviceModel implements DeviceInfo {
  @Field(() => String, { nullable: true })
  public browser: string;

  @Field(() => String, { nullable: true })
  public os: string;

  @Field(() => String, { nullable: true })
  public type: string;
}

@ObjectType()
export class SessionMetadataModel implements SessionMetadata {
  @Field(() => LocationModel, { nullable: true })
  public location: LocationModel;

  @Field(() => DeviceModel, { nullable: true })
  public deviceInfo: DeviceModel;  // Исправлено поле device -> deviceInfo

  @Field(() => String, { nullable: true })
  public ip: string;
}

@ObjectType()
export class SessionModel {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public userId: string;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => SessionMetadataModel, { nullable: true })
  public metadata: SessionMetadataModel;
}
