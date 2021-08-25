import { EntitySchema } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

export const UserSchema = new EntitySchema<UserEntity>({
  
    name: 'users',
  
    target: UserEntity,
  
  columns: {
    id: {
      type: Number,
      primary: true,
    },
    email: {
      type: String,
    },
    login: {
      type: String,
    },
    nickname: {
        type: String,
    },
    first_name: {
        type: String,
    },
    last_name: {
        type: String,
      },
    status: {
        type: Number,
    },
    role: {
        type: String,
    },
  }
});