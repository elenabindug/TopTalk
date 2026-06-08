# prisma-erd

A lightweight package that generates an ERD from a prisma schema.

## Install

Install the package as a dev dependency:

```shell
npm install -D prisma-erd
# OR
yarn add -D prisma-erd
# OR
pnpm add -D prisma-erd
```

## Usage

Run a single command to create an HTML file containing a graph of your schema:

```shell
npx prisma-erd <input file path> <optional output file path>
# OR
yarn exec prisma-erd <input file path> <optional output file path>
# OR
pnpm exec prisma-erd <input file path> <optional output file path>
```

Example:

```shell
npx prisma-erd ./prisma/schema.prisma
```

## Development Setup

1. Install packages via pnpm

```
pnpm i
```

2. Check package.json for scripts, such as `pnpm build:install` to build and globally install the package on your machine
