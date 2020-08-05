import React from 'react'
import {Styles} from './DayOfWeekSelectorStyles'

type Props={
    weekday: boolean,
    onChange: (weekday:boolean)=>void
}
export function DayOfWeekSelector({weekday,onChange}: Props){
    return (
        <Styles.Container>
            <Styles.Option onClick={()=> onChange(true)}>
                <input type="radio"
                value={'weekday'}
                name={'weekday'}
                onChange={e => onChange(true)}
                checked={weekday} />
                Weekday
            </Styles.Option>
            <Styles.Option onClick={()=>onChange(false)}>
                <input type="radio"
                value={'weekend'}
                name={'weekend'}
                onChange={e => onChange(false)}
                checked={!weekday} />
                Weekend
            </Styles.Option>
        </Styles.Container>
    )
}