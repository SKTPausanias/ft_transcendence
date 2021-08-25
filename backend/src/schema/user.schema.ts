import { EntitySchema } from 'typeorm';
import { users } from '../entity/user.entity';

export const UserSchema = new EntitySchema<users>({
  
    name: 'users',
    target: users,
  
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