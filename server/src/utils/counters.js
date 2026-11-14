import mongoose from 'mongoose'

/** Atomic sequence numbers (listing numbers, cluster codes, order numbers). */
const counterSchema = new mongoose.Schema({ _id: String, seq: Number })
const Counter = mongoose.models.Counter ?? mongoose.model('Counter', counterSchema)

export async function nextSequence(name) {
  const doc = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true })
  return doc.seq
}
