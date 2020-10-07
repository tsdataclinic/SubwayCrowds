import React, {useState} from 'react'
import {Styles} from './SimplePasswordStyles'
import md5 from 'md5'

type SimplePasswordProps = {
    onPassed: ()=>void
}

export const SimplePassword: React.FC<SimplePasswordProps> = ({onPassed})=>{
    const [enteredPassword, setEntredPassword] = useState('')
    const [attemptFailed, setAttemptFailed] = useState(false)

    const checkPassword= (password: string)=>{
        if (md5(password)==='7959b961846e0e1355e4440d6f0b344c'){
            onPassed()
        }
        else{
            setAttemptFailed(true)
            setTimeout(()=> setAttemptFailed(false), 3000)
        }
    }

    return(
        <Styles.SimplePasswordContainer>
            <Styles.PasswordInput type='password' placeholder="Enter the password." onChange={e=> setEntredPassword(e.target.value)} value={enteredPassword}/>
            <Styles.PasswordSubmit onClick={e=> checkPassword(enteredPassword)}>Submit</Styles.PasswordSubmit>
            {attemptFailed && 
                <p>Sorry that password was wrong.</p>
            }
        </Styles.SimplePasswordContainer>

    )
}