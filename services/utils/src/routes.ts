import express from 'express' 
import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import multer from 'multer';

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/upload', upload.single('file'), async (req,res) => {
    try {
        const {public_id} = req.body
        const file = req.file


        
        console.log(file)

        if (!file) {
            return res.status(400).json(
                {
                    message : 'No file provided'
                }
            )
        }

        if (public_id){
            await cloudinary.v2.uploader.destroy(public_id)
        }

        const uploadStream = () => {
            return new Promise((resolve,reject) => {
                const stream = cloudinary.v2.uploader.upload_stream(
                    {
                        folder : 'recruitex'
                    },
                    (error,result) => {
                        if (error) return reject(error)
                        resolve(result)
                    }
                )


                streamifier.createReadStream(file.buffer).pipe(stream)
            })
        }

        const result : any = await uploadStream()

        res.json({
            url : result.secure_url,
            public_id : result.public_id
        })

    } catch (error : any) {
        res.status(500).json({
            message : error.message
        })
    }
})

export default router
