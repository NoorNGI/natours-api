export class APIFeatures {
  // query model from the mongoose,
  // queryString from the route query params,
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1) FILTERING
  filter() {
    const queryObj = { ...this.queryString };

    // 1a) BASIC FILTERING...
    const excludedFields = ["page", "limit", "sort", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1b) ADVANCE FILTERING...

    // ?sort=price&difficulty[gte]=easy --> query params...
    // { sort: 'price', difficulty: { gte: 'easy' } } --> getting this
    // { sort: 'price', difficulty: { $gte: 'easy' } } --> want this

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    // to chain the other methods, we are returning the whole object.
    return this;
  }

  // 2) SORTING
  sort() {
    // ?sort=price,-duration...
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);

      // query.sort('price -ratingsAverage')
    } else {
      this.query = this.query.sort("-createdAt");
    }

    // to chain the other methods, we are returning the whole object.
    return this;
  }

  // 3) FIELDS LIMITING
  limitFields() {
    // ?fields=name,price,-duration
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    // to chain the other methods, we are returning the whole object.
    return this;
  }

  // 4) PAGINATION
  paginate() {
    // ?page=2&limit=10 --> 1-10, 11-20, 21-30
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // to chain the other methods, we are returning the whole object.
    return this;
  }
}
