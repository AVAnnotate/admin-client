import { LoadingOverlay } from '@components/LoadingOverlay/LoadingOverlay.tsx';
import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import type { Translations } from '@ty/Types.ts';
import { useMemo, useState } from 'react';
import { ExclamationTriangle } from 'react-bootstrap-icons';
import './DeleteModal.css';

interface Props {
  additionalText?: string | React.ReactElement | React.ReactElement[];
  className?: string;
  i18n: Translations;
  name: string;
  onCancel: () => any;
  onDelete: () => any;
}

export const DeleteModal: React.FC<Props> = (props) => {
  const [loading, setLoading] = useState(false);

  const { t } = props.i18n;

  const additionalText = useMemo(() => {
    if (typeof props.additionalText === 'string') {
      return <p>{props.additionalText}</p>;
    } else {
      return props.additionalText;
    }
  }, [props.additionalText]);

  return (
    <>
      <AlertDialog.Root open>
        <AlertDialog.Content
          className={`delete-modal ${props.className || ''}`}
        >
          {loading && <LoadingOverlay />}
          <div className='content-container'>
            <div className='icon-container'>
              <ExclamationTriangle />
            </div>
            <div className='text-container'>
              <AlertDialog.Title>{`${t['Delete']} ${props.name}`}</AlertDialog.Title>
              <AlertDialog.Description className='alert-description'>{`${
                t['Are you sure you want to delete this']
              } ${props.name.toLocaleLowerCase()}?`}</AlertDialog.Description>
              {additionalText}
              <p>{t['You cannot undo this action.']}</p>
              <Flex gap='3' mt='4' justify='end' className='bottom-bar'>
                <AlertDialog.Cancel onClick={props.onCancel}>
                  <Button className='unstyled delete-modal-button cancel-button'>
                    {t['cancel']}
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action
                  onClick={async () => {
                    setLoading(true);
                    await props.onDelete();
                    setLoading(false);
                  }}
                >
                  <Button className='unstyled delete-modal-button delete-button'>
                    {t['Delete']}
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
