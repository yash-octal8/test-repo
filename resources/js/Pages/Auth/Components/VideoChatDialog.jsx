import Button from '../../../Components/ui/Button';
import DialogBox from '../../../Components/DialogBox';

const VideoChatDialog = ({ open, setOpen, handleStartChat }) => {
    return (
        <DialogBox
            maxWidth="max-w-md"
            isOpen={open}
            variant={'gray'}
            title={'Video Chat is now live!🎉'}
            setIsOpen={setOpen}>
            <div className="mb-4">
                We now have a video chat section! You can now chat with your
                matches face-to-face. Give it a try! 🚀
            </div>
            <div className={'space-y-4'}>
                <Button
                    className={'w-full'}
                    onClick={handleStartChat}
                    variant={'purple'}
                    icon={'camera'}>
                    Try Video Chat
                </Button>
                <Button
                    className={'w-full'}
                    onClick={handleStartChat}
                    variant={'secondary'}
                >
                    Not Now
                </Button>
            </div>
        </DialogBox>
    );
};

export default VideoChatDialog;
