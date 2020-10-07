import React, {useState} from 'react'
import Styles from './SentanceDropDownStyles'
import { clear } from 'console';

interface DropDownOption{
    text?: string;
    key:  string;
    icon?: string;
    
}

interface Props {
    prompt: string;
    options: DropDownOption[];
    onSelected?: (option:string | null)=>void;
    selectedID?: string | null,
    useIcon?:boolean,
    active:boolean
}

export default function SentanceDropDown ({prompt, options,selectedID, onSelected, active, useIcon=false}: Props){
    const [searchTerm, setSearchTerm] = useState<string>('')

    const [showDropDown, setShowDropDown] = useState(false);
    const selected = options?.find(option => option.key === selectedID)

    const filteredOptions = searchTerm ? options.filter(option=>
        option.text?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
        || option.key?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
        ) : options

    const updateSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)
    const setSelected = (option:DropDownOption)=>{
        if(onSelected){
            onSelected(option.key)
            setShowDropDown(false)
        }
    }

    const clear = ()=>{
        if(active){
            setShowDropDown(true)
        }
        if(onSelected && active){
            onSelected(null)
        }
    }

    return(
        <Styles.Container>
            {selected ?
             <span onClick={clear} style={{fontWeight:'bold'}}>{ (selected.icon && useIcon) ? <Styles.Icon src={selected.icon} /> : ''}{selected.text && !useIcon ? selected.text : ''}</span>
             :
             <Styles.Input onFocus={()=>setShowDropDown(true)} placeholder={prompt} onChange={updateSearch} value={searchTerm}></Styles.Input>
            }
            {showDropDown &&
                <Styles.DropDownList>
                    {filteredOptions.map(option=>
                        <Styles.DropDownListEntry onClick={()=>setSelected(option)} key={option.key}>
                            {(option.icon && useIcon) &&
                                <Styles.Icon src={option.icon} />
                            }
                            {option.text && !useIcon &&
                                <span>{option.text}</span>
                            }
                        </Styles.DropDownListEntry>
                    )}
                </Styles.DropDownList>
            }
        </Styles.Container>
    )
}
