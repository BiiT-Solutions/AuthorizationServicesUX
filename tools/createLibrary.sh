#!/bin/bash
read -p "Project Name: " PROJECT_NAME
read -p "Library Name (DON'T INCLUDE '-lib'): " LIB_NAME

ng new $PROJECT_NAME --create-application=false
cd $PROJECT_NAME || exit 1
npm install authorization-services-lib@latest

LIB_PATH=$LIB_NAME-lib
ng g lib $LIB_PATH
cd projects/$LIB_PATH/src || exit 1
echo > public-api.ts
cd lib || exit 1

rm *

cat > constants.ts <<EOL
export class Constants {
  public static readonly SESSION_STORAGE = class {
    public static readonly CONTEXT: string = '${LIB_NAME}';
  }
}
EOL

mkdir -p models services
cd services || exit 1
ng g s $LIB_NAME-root

sed -i "2 s/^/import {RootPath} from 'authorization-services-lib';\n/" $LIB_NAME-root.service.ts
sed -i "s/Service {/Service implements RootPath {/g" $LIB_NAME-root.service.ts

sed '/constructor/r'<(cat <<EOF

  private rootUrl: URL = null;

  public set serverUrl(url: URL) {
    this.rootUrl = url;
  }

  public get serverUrl(): URL {
    return this.rootUrl;
  }

  getRootPath(): URL {
    return this.rootUrl;
  }
EOF
) -i -- $LIB_NAME-root.service.ts

ROOT_NAME=`cat $LIB_NAME-root.service.ts | grep -o -P '(?<=class).*(?=implements)' | xargs`

ng g s auth

sed -i "2 s/^/import {HttpClient} from '@angular\/common\/http';\n/" auth.service.ts
sed -i "3 s/^/import {$ROOT_NAME} from '.\/${LIB_NAME}-root.service';\n/" auth.service.ts
sed -i "4 s/^/import {AuthService as AuthenticationService} from 'authorization-services-lib';\n/" auth.service.ts
sed -i "s/Service {/Service extends AuthenticationService {/g" auth.service.ts

sed '/constructor/r'<(cat <<EOF
  CONST_NEW(rootService: $ROOT_NAME, httpClient: HttpClient) {
    super(rootService, httpClient);
  }

EOF
) -i -- auth.service.ts

sed -i "/constructor\(\)/d" auth.service.ts
sed -i "s/CONST_NEW/constructor/g" auth.service.ts

ng g s session

sed -i "2 s/^/import {SessionService as AuthSessionService} from 'authorization-services-lib';\n/" session.service.ts
sed -i "3 s/^/import {AuthService} from '.\/auth.service';\n/" session.service.ts
sed -i "4 s/^/import {Constants} from '..\/constants';\n/" session.service.ts
sed -i "s/Service {/Service extends AuthSessionService {/g" session.service.ts
sed '/constructor/r'<(cat <<EOF
  CONST_NEW(authService: AuthService) {
    super(authService, Constants.SESSION_STORAGE.CONTEXT);
  }

EOF
) -i -- session.service.ts

sed -i "/constructor\(\)/d" session.service.ts
sed -i "s/CONST_NEW/constructor/g" session.service.ts

cd ../..
cat > public-api.ts <<EOL

export * from './lib/services/session.service';
export * from './lib/services/auth.service';
export * from './lib/services/$LIB_NAME-root.service';

EOL

cd ../../..

sed '/forceConsistentCasingInFileNames/r'<(cat <<EOF
    "strictNullChecks": false,
EOF
) -i -- tsconfig.json
