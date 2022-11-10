const advanceResult = (model,populate)=> async(req,res,next)=>{
    let query
    const reqQuery = {...req.query}

    const removeField = ['select', 'sort','page','limit']

    removeField.forEach(param => delete reqQuery[param])

    let queryStr = JSON.stringify(reqQuery)

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g , match=> `$${match}`)

    query = model.find(JSON.parse(queryStr))

    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else{
        query = query.sort('-name')
    }
  
    const page = parseInt(req.query.page,10) || 1
    const limit = parseInt(req.query.limit,10) || 100
    const startIndex = (page-1)*limit 
    const endIndex = page * limit

    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if(populate){
        query = query.populate(populate)
    }
        const results = await query

        res.advanceResults ={
            success: true,
            count: results.length,
            data:results
        }
        next()
}

module.exports = advanceResult