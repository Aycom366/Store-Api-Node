const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  //$gt means greater than while $lt means less than
  const products = await Product.find({ price: { $gt: 30 } }).sort("price");

  res.status(200).json({ msg: products, nHits: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;

  //settings up new object to pass into the query products objects
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }

  //finding data in the database by regex
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numericFilters) {
    //setting up operators map coz mongoose understand only $gt, $lt, $gte, $lte
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      //array destructuring below
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  console.log(queryObject);

  let result = Product.find(queryObject);

  //sorting the data, either by name or price or more
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }

  //fields to return
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }

  //limit the number of results to be returned
  //limit also means the amount of numbers you wanna let the response return
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  //then chain them to result
  //value of skip is the number of results to skip
  result = result.skip(skip).limit(limit);

  const products = await result;

  //this syntax below return empty array if nothing matches in the dataase which is right
  //   const products = await Product.find(req.body);
  res.status(200).json({ products, nHits: products.length });
};

module.exports = { getAllProductsStatic, getAllProducts };
