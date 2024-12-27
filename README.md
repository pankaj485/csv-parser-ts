# ts-express-starter

A very simple API based CSV to JSON parser built with typescript and nodejs.

## Project Setup:

1. Install dependencies: `npm install`
2. Compile typescript with watch mode: `npm run watch`
3. Run server with watch mode: `npm run dev`

## How to use:

For ease of usage, the application is made as declarative as possible. So that end user can easily get the result without worrying about the implementation details.

### 1. Upload a CSV file

Create `public` directory in the root of the project and upload a CSV file to that directory.

### 2. Configure file path

Open `/src/utils/parserconfig.ts` file and update the `uploadPath` variable to the path of the uploaded file.

> PS: The uploaded file path should be relative from the `src/utils/parserconfig.ts` file.

### 3. Parse CSV file to JSON

Open the browser and hit the following URL:

```text
  http://localhost:3000/api/v1/csv-parser
```

Following will be the structure of the response:

```text
{
  success: boolean,
  message: string,
  rowsParsed: number,
  data: {[key: string]: string}[]
}
```

> PS: If you quickly want to test the application, you can directly hit [http://localhost:3000/api/v1/csv-parser](http://localhost:3000/api/v1/csv-parser) and it will parse the existing sample csv file present in the repository.

sample file was referenced from [www.stats.govt.nz](https://www.stats.govt.nz/large-datasets/csv-files-for-download/)
