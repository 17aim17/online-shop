const fs =require('fs')

const deleteFile = (filepath) =>{
    fs.unlink(`./${filepath}`,(err)=>{
        if(err){
            throw new Error(err)
        }
    })
}

module.exports = { deleteFile}
