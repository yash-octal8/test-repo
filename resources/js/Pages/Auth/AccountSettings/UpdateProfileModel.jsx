import DialogBox from '../../../Components/DialogBox';
import Button from '../../../Components/ui/Button';
import Input from '../../../Components/Form/Input';
import { useState } from 'react';
import RadioButtonGroup from '../../../Components/RadioButtonGroup';
import Male from '../../../Components/Icon/Male';
import Female from '../../../Components/Icon/Female';
import Label from '../../../Components/Form/Label';
import listenApi from '../../../Utils/Api';
import { __listenUpdateUser } from '../../../Store/AuthSlice';
import { useDispatch } from 'react-redux';
import iziToast from 'izitoast';

const UpdateProfileModel = ({ open, setOpen, user }) => {
    const _dispatch = useDispatch();

    const options = [
        { name: 'Male', value: 'male', icon: <Male /> },
        { name: 'Female', value: 'female', icon: <Female /> },
    ];

    const [formData, setFormData] = useState({
        name: user?.name,
        email: user?.email,
        location: user?.location,
        gender: options.find(item => item?.value === user?.extra_info?.gender),
    });

    const updateState = ({ target }) => {
        setFormData(prev => ({
            ...prev,
            [target.name]: target.value,
        }));
    };

    const handleUpdateGender = (gender) => {
        setFormData(prev => ({
            ...prev,
            ['gender']: gender,
        }));
    };

    const handleSubmitForm = () => {
        const payload = { ...formData };
        payload.gender = payload.gender.value;

        listenApi.post('update-profile', payload).then(res => {
            iziToast.success({
                title: 'Updated',
                position: 'topCenter',
                message: 'Successfully update user profile!',
            })
            const data = res.data?.data?.user;
            _dispatch(__listenUpdateUser(data));
            setOpen(false);
        });
    };

    return (
        <DialogBox
            isOpen={open}
            variant={'dark'}
            maxWidth={'max-w-2xl'}
            title={' Update Profile'}
        >
            <div className="grid grid-cols-2 gap-5">
                <Input
                    type={'text'}
                    label={'Name'}
                    name={'name'}
                    value={formData?.name}
                    onChange={updateState}
                />
                <Input
                    disabled={!formData?.email}
                    type={'email'}
                    name={'email'}
                    label={'Email'}
                    value={formData?.email}
                    onChange={updateState}
                />

                <Input
                    type={'text'}
                    name={'location'}
                    label={'Location'}
                    value={formData?.location}
                    onChange={updateState}
                />
                <div />
                <div>
                    <Label
                        value={'Gender'}
                        className={'text-white'}
                    />
                    <RadioButtonGroup
                        options={options}
                        valueKey="name"
                        selected={formData.gender}
                        onChange={handleUpdateGender}
                        label="Choose Plan"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button
                    onClick={() => setOpen(false)}
                    variant={'secondary'}
                >
                    Cancel
                </Button>
                <Button
                    variant={'roseGradient'}
                    onClick={handleSubmitForm}>
                    Save Changes
                </Button>
            </div>
        </DialogBox>
    );
};

export default UpdateProfileModel;
