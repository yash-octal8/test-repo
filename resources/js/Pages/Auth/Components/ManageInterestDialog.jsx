import Button from '../../../Components/ui/Button';
import DialogBox from '../../../Components/DialogBox';
import Toggle from '../../../Components/ui/Toggle';
import Input from '../../../Components/Form/Input';
import { useState } from 'react';
import Badge from '../../../Components/Badge';
import { XCircleIcon } from 'lucide-react';
import listenApi from '../../../Utils/Api';
import { __listenUpdateUser } from '../../../Store/AuthSlice';
import { useDispatch, useSelector } from 'react-redux';

const ManageInterestDialog = ({ open, setOpen, handleSubmit }) => {
    const user = useSelector(state => state.auth.user);
    const [isEnable, setIsEnable] = useState(!!user?.extra_info?.is_interest);
    const [interests, setInterests] = useState(user?.extra_info?.interests || []);
    const _dispatch = useDispatch()

    const handleInterest = async (e) => {
        const value = e.target.value.trim();
        if (!value) return;
        if (interests.includes(value)) return;
        await setInterests((prev) => {
            let data = [...prev, value];
            listenApi.post('update-profile', {
                interests: data,
            }).then(res => {
                _dispatch(__listenUpdateUser(res.data.data.user))
                e.target.value = '';
            }).catch(e => {
                console.error(e);
            });

            return data;
        });
    };
    
    const handleRemoveInterest = (key) => 
        setInterests(() => {
            let data = interests.filter((_,i) => i !== key)
            listenApi.post('update-profile', {
                interests: data,
            }).then(res => {
                _dispatch(__listenUpdateUser(res.data.data.user))
            }).catch(e => {
                console.error(e);
            });
            
            return data;
        })

    const handleToggleInterest = () => {
        setIsEnable(() => {
            listenApi.post('update-profile', {
                is_interest: !isEnable,
            }).then(res => {
                _dispatch(__listenUpdateUser(res.data.data.user));
            }).catch(e => {
                console.error(e);
            });

            return !isEnable;
        });
    };
return(
    <DialogBox
        maxWidth="max-w-md"
        isOpen={open}
        variant={'gray'}
        title={'Manage Interests'}
        setIsOpen={setOpen}>
        <div className="mb-4">
            Add and remove interests to help us find better matches for you.
        </div>
        <div className={'space-y-5 bg-gray-900 rounded-lg p-2 flex items-center justify-between'}>
            <label className={'m-0'}>
                Match with interests
            </label>
            <Toggle
                value={isEnable}
                onChange={handleToggleInterest}
                variant="pink"
                size="md"
            />
        </div>
        <div className={'py-4 flex flex-col gap-2'}>
            {
                interests?.length ?
                <div className={'flex items-center flex-wrap gap-2'}>    
                    {
                        interests?.map((interest, key) => {
                            return <Badge 
                                key={key}
                                className={'flex items-center gap-2'}
                                onClick={()=> handleRemoveInterest(key)}
                            >
                                <XCircleIcon size={'16'}/>
                                <span>{interest} </span>
                            </Badge>
                        })
                    }
                </div> : ''
            }
            <Input
                onBlur={handleInterest}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleInterest(e);
                    }
                }}
                placeholder="Add your interest" />

        </div>
        <div className={'my-4'}>
            <Button
                className={'w-full'}
                onClick={handleSubmit}
                variant={'secondary'}
            >
                Done
            </Button>
        </div>
    </DialogBox>
)
}

export default ManageInterestDialog;
