import React, {useState} from 'react'
import Styles from './SentanceDropDownStyles'

interface DropDownOption{
    text?: string;
    key:  string;
    icon?: string;
    
}
interface Props {
    prompt: string;
    options: DropDownOption[];
    onSelected?: (option:string)=>void;
    selectedID?: string | null,
    useIcon?:boolean
}
export default function SentanceDropDown ({prompt, options,selectedID, onSelected, useIcon=false}: Props){
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

    return(
        <Styles.Container>
            {selected ?
             <span style={{fontWeight:'bold'}}>{ (selected.icon && useIcon) ? <Styles.Icon src={selected.icon} /> : ''}{selected.text && !useIcon ? selected.text : ''}</span>
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
