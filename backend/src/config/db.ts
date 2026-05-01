import mongoose from "mongoose"

export const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

        // Handling connection events
        conn.connection.on('error', (err) => {
            console.log(`❌ MongoDB connection error: ${err}`)
        })

        conn.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected. Attempting to reconnect...')
        })


    } catch (error) {
        if(error instanceof Error) {
            console.error(`❌ MongoDB connection failed: ${error.message}`)
        }
        process.exit(1)
    }
}