const handleError = (res, error)=>{
    if(error['errors'] != null){
        const key = Object.keys(error['errors']); 
        const errorFields = []; 
        key.forEach((key)=>{
            let field = error['errors'][key]; 
            errorFields.push({
                type: field['kind'],
                message: field['message']
            }); 
        }); 
        if(errorFields.length > 0){
            return res.status(400).send({
                status: false,
                message: errorFields
            }); 
        }
    }

    return res.status(500).send({
        status: false,
        message: error.message
    }); 
}

module.exports = {
    handleError
}