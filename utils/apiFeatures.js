// this will allow advanced querys to be made
// ex.:
// url...?fields=name,price&sort=price&limit=10&page=3&ratingsAverage[gte]=4

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // FILTER with mongoDB operators gt, gte, lt, lte
  filter() {
    const queryObj = { ...this.queryString }; // hard copy

    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    // adds '$' before operator - the metacharacter \b is really important!
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // SORT by an especific field
  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.replace(/,/g, ' ');
      this.query.sort(sortFields);
    }

    return this;
  }

  // PAGE and LIMIT for pagination
  pagination() {
    const page = this.queryString.page || 1; // if undefined, sets to one
    const limit = this.queryString.limit || 20;

    this.query.skip(limit * (page - 1)).limit(limit);

    return this;
  }

  // SELECT which document fields to include
  selectFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query.select(fields);
    } else {
      this.query.select('-__v');
    }

    return this;
  }
}

module.exports = APIFeatures;
