import { FunctionComponent } from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';


interface loadingProps {
    
}
 
const loading: FunctionComponent<loadingProps> = () => {
    return ( 
        <div className="w-full flex flex-col gap-3">
            <Skeleton className='mb-4' width={500} height={60}/>
            <Skeleton width={350} height={50}/>
            <Skeleton width={350} height={50}/>
            <Skeleton width={350} height={50}/>
   
        </div>
     );
}
 
export default loading;