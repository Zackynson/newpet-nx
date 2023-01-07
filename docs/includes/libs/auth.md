### Libs/Auth Topics

- [Libs/Auth Topics](#libsauth-topics)
- [Access Keys](#access-keys)
- [Creating a signed JWT token from an access-key](#creating-a-signed-jwt-token-from-an-access-key)
- [Token validation](#token-validation)

### Access Keys

Access Keys are used to generate JWT tokens capable of authenticating and performing operations on the newpet backend.

With them, it is possible to define which scopes the tokens generated from it will have access and which actions can be performed in that scope. For example, we can create an access key for "Panel Operators" who have the ability to create transactions, for this we include the scope 'transactions:create' in the permissions of the key.

When creating an access-key we'll generate a random ID and a random secret to it, which both will be used to verify if the JWT generated from it is valid.

![How the access-key creation works.](media://libs/auth/create-access-key.drawio.png)

### Creating a signed JWT token from an access-key

To authenticate to the newpet project, users must use a valid JWT token signed from an access key, using the access key secret as the token's encryption key, and loading the access key in its payload body, in the `iss` property. Since we've chosen not to share the ID or secret of our tokens with our clients, we've provided a helper method in our auth library to generate signed tokens from access keys.

You can create multiples tokens with different expiration dates from an access-key

![How the access-key signed token creation works.](media://libs/auth/create-signed-token.drawio.png)

### Token validation

In order to perform requests to newpet it is required to provide an `Authorization` property on request Headers containing authentication token combined with prefix `Bearer`.

```ts

Headers: {
  ...
  Authorization: `Bearer ${token}`
}

```

To validade provided token in our application HTTP endpoints, when using NestJs structure it is possible to apply a custom decorator from auth library and to informe which permissions are necessary to be allowed for accessing that resource.

```ts
import { Controller } from '@nestjs/common';
import { JwtPermissionAuth } from '@libs/auth';

@Controller()
@JwtPermissionAuth(['scope:action'])
export class ExampleController {
  constructor() {}
  ...
}
```

For being able to utilize jwt based on permissions to guarantee resources security all that is necessary is including `AuthModule` from auth library on app module imports.

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from '@libs/auth';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [AuthModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
```

![How the token validation works.](media://libs/auth/token-validation.drawio.png)
