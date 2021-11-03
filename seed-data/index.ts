import { products } from './data';
import { KeystoneContext } from '@keystone-next/keystone/types';

export async function insertSeedData(ks: KeystoneContext) {
  // Keystone API changed, so we need to check for both versions to get keystone
  const keystone = ks;
  const adapter = keystone.db;

  console.log(`🌱 Inserting Seed Data: ${products.length} Products`);

  await adapter.Product.deleteMany({ where: [] });
  await adapter.ProductImage.deleteMany({ where: [] });
  for (const product of products) {
    console.log(`  🛍️ Adding Product: ${product.name}`);
    // const { _id } = await adapter.ProductImage.createOne({
    //   data: {
    //     image: {
    //       filename: product.photo.filename,

    //       mimetype: product.photo.mimetype,
    //       encoding: product.photo.encoding,
    //     },
    //     altText: product.description,
    //   },
    // });
    // product.photo = _id;

    await adapter.Product.createOne({ data: product });
  }
  console.log(`✅ Seed Data Inserted: ${products.length} Products`);
  console.log('👋 Please start the process with `yarn dev` or `npm run dev`');
  process.exit();
}
