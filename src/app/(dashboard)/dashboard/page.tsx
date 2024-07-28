import Button from "@/components/ui/Button";
import { getServerSession } from "next-auth";
import { FunctionComponent } from "react";
import { authOptions } from "@/lib/auth";

interface pageProps {
    
}
 
const page = async ({}) => {

    const session = await getServerSession(authOptions)
    return (  
<pre>DashBoard</pre>
    );
}
 
export default page;