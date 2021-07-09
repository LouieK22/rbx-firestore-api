#!/bin/sh

npm run build

npm pack --quiet

cd ../verde-cafe
npm i ../rbx-firestore-api/rbxts-firestore-2.0.0.tgz
