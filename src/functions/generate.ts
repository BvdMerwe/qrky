import QRCode from 'qrcode'
import {createClient} from "@/lib/server-client";

// fetch qr code from db
// use qr code settings
// generate qr code
// add logo
// render svg/jpg/png

Deno.serve(async (req: Request) => {
    const supabase = await createClient();
    // ...
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabase.auth.getUser(token)
    // ...
})


// With promises
QRCode.toDataURL('I am a pony!')
    .then(url => {
        console.log(url)
    })
    .catch(err => {
        console.error(err)
    })
