import { DynamicIcon } from 'lucide-react/dynamic';
import Button from '../../../Components/ui/Button';
import DialogBox from '../../../Components/DialogBox';

const RemoveAvatarModel = ({open, isBannerUpload, handleRemoveAvatar, handleCloseAvatarDialog}) => {
    return (
        <>
            <DialogBox
                title={''}
                maxWidth={'max-w-sm'}
                isOpen={open}
                className={'!py-2'}

            >
                <div className={'flex items-center gap-3'}>
                    <p>Are you sure want to remove
                        {isBannerUpload ? ' banner' : ' avatar'}
                    </p>
                    <DynamicIcon
                        name={'triangle-alert'}
                        size={30}
                    />
                </div>
                <div className={'flex justify-end gap-3 mt-8'}>
                    <Button
                        onClick={handleRemoveAvatar}
                        variant={'rose'}
                        icon={'trash-2'}
                    >
                        Remove
                    </Button>
                    <Button
                        onClick={handleCloseAvatarDialog}
                        variant={'secondary'}
                        icon={'x'}
                    >
                        Close
                    </Button>
                </div>
            </DialogBox>
        </>
    );
};

export default RemoveAvatarModel;
